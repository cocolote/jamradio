class SongsController < ApplicationController
  respond_to :json, :html

  def index
    respond_to do |format|
      format.json { render json: { songs: current_user.songs.order("updated_at") } }
    end
  end

  def create
    @song = Song.find_or_create_by(song_params)
    @user_song = UserSong.new(user: current_user, song: @song)
    if @user_song.save
      respond_to do |format|
        format.json { render json: @song }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @user_song.errors.full_messages }, status: 403 }
      end
    end
  end

  def destroy
    @user_song = UserSong.find_by(user: current_user, song_id: params[:id])
    UserSong.delete(@user_song)
    song = Song.find(params[:id])
    respond_to do |format|
      format.json { render json: { sc_song_id: song.sc_song_id, message: "The song was deleted" } }
    end
  end

  protected

  def song_params
    params.require(:song).permit(:sc_song_id, :title, :duration)
  end
end
