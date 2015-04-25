class CreateGuests < ActiveRecord::Migration
  def change
    create_table :guests do |t|
      t.integer :jam_id, null: false
      t.integer :user_id, null: false

      t.timestamps null: false
    end
    add_index :guests, [:jam_id, :user_id], unique: true
  end
end
