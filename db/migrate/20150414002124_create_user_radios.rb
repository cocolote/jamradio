class CreateUserRadios < ActiveRecord::Migration
  def change
    create_table :user_radios do |t|
      t.integer :user_id, null: false
      t.integer :radio_id, null: false

      t.timestamps null: false
    end
    add_index :user_radios, [:user_id, :radio_id], unique: true
  end
end
