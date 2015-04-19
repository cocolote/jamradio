class CreateJams < ActiveRecord::Migration
  def change
    create_table :jams do |t|
      t.string :name, null: false
      t.integer :creator_id, null: false

      t.timestamps
    end
    add_index :jams, [:name, :creator_id], unique: true
  end
end
